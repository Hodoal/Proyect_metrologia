import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse';
import * as XLSX from 'xlsx';
import { DataPoint, ApiResponse, ProcessedFile } from '../types';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    const allowedExtensions = ['.csv', '.xls', '.xlsx'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
    }
  },
});

router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      const response: ApiResponse = {
        success: false,
        error: 'No file uploaded',
        message: 'Please select a file to upload',
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const file = req.file;
    let data: DataPoint[] = [];
    const errors: string[] = [];

    try {
      if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
        data = await parseCSVFile(file.buffer, errors);
      } else if (file.originalname.toLowerCase().endsWith('.xlsx') || file.originalname.toLowerCase().endsWith('.xls')) {
        data = await parseExcelFile(file.buffer, errors);
      } else {
        throw new Error('Unsupported file format');
      }
      } catch (parseError) {
        const response: ApiResponse = {
          success: false,
          error: 'File parsing error',
          message: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          timestamp: new Date().toISOString(),
        };
        res.status(400).json(response);
        return;
      }    const processedFile: ProcessedFile = {
      filename: file.originalname,
      size: file.size,
      type: file.mimetype,
      data,
      summary: {
        totalPoints: data.length,
        validPoints: data.filter(p => !isNaN(p.x) && !isNaN(p.y)).length,
        errors,
      },
    };

    const response: ApiResponse<DataPoint[]> = {
      success: true,
      data,
      message: `Successfully processed ${data.length} data points from ${file.originalname}`,
      timestamp: new Date().toISOString(),
    };

    res.json(response);

  } catch (error) {
    next(error);
  }
});

async function parseCSVFile(buffer: Buffer, errors: string[]): Promise<DataPoint[]> {
  return new Promise((resolve, reject) => {
    const data: DataPoint[] = [];
    const csvString = buffer.toString('utf-8');

    parse(csvString, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }, (error, records) => {
      if (error) {
        reject(new Error(`CSV parsing error: ${error.message}`));
        return;
      }

      records.forEach((record: any, index: number) => {
        try {
          const keys = Object.keys(record);
          
          // Try different column name variations
          const xValue = parseFloat(record.X || record.x || record['0'] || (keys[0] ? record[keys[0]] : ''));
          const yValue = parseFloat(record.Y || record.y || record['1'] || (keys[1] ? record[keys[1]] : ''));
          
          if (isNaN(xValue) || isNaN(yValue)) {
            errors.push(`Row ${index + 1}: Invalid X or Y value`);
            return;
          }

          const point: DataPoint = { x: xValue, y: yValue };

          // Optional uncertainty columns
          const uxValue = parseFloat(record.ux || record.UX || record.uX || record['2'] || (keys[2] ? record[keys[2]] : ''));
          const uyValue = parseFloat(record.uy || record.UY || record.uY || record['3'] || (keys[3] ? record[keys[3]] : ''));

          if (!isNaN(uxValue) && uxValue > 0) {
            point.ux = uxValue;
          }

          if (!isNaN(uyValue) && uyValue > 0) {
            point.uy = uyValue;
          }

          data.push(point);

        } catch (err) {
          errors.push(`Row ${index + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      });

      resolve(data);
    });
  });
}

async function parseExcelFile(buffer: Buffer, errors: string[]): Promise<DataPoint[]> {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    
    if (!sheetName) {
      throw new Error('No sheets found in Excel file');
    }

    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error('Worksheet not found');
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const data: DataPoint[] = [];

    // Skip header row if it exists (check if first row contains strings)
    let startRow = 0;
    if (jsonData.length > 0) {
      const firstRow = jsonData[0] as any[];
      if (firstRow.some((cell: any) => typeof cell === 'string' && isNaN(parseFloat(cell)))) {
        startRow = 1;
      }
    }

    for (let i = startRow; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      if (!row || row.length < 2) {
        errors.push(`Row ${i + 1}: Insufficient columns`);
        continue;
      }

      try {
        const xValue = parseFloat(row[0]);
        const yValue = parseFloat(row[1]);

        if (isNaN(xValue) || isNaN(yValue)) {
          errors.push(`Row ${i + 1}: Invalid X or Y value`);
          continue;
        }

        const point: DataPoint = { x: xValue, y: yValue };

        // Optional uncertainty columns
        if (row.length > 2) {
          const uxValue = parseFloat(row[2]);
          if (!isNaN(uxValue) && uxValue > 0) {
            point.ux = uxValue;
          }
        }

        if (row.length > 3) {
          const uyValue = parseFloat(row[3]);
          if (!isNaN(uyValue) && uyValue > 0) {
            point.uy = uyValue;
          }
        }

        data.push(point);

      } catch (err) {
        errors.push(`Row ${i + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return data;

  } catch (error) {
    throw new Error(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export default router;