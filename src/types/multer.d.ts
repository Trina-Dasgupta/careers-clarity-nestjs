declare module 'multer' {
  import { Request } from 'express';

  type MulterFile = Express.Multer.File;

  interface DiskStorageOptions {
    destination?:
      | string
      | ((
          req: Request,
          file: MulterFile,
          callback: (error: Error | null, destination: string) => void,
        ) => void);
    filename?: (
      req: Request,
      file: MulterFile,
      callback: (error: Error | null, filename: string) => void,
    ) => void;
  }

  // Partial interface mirroring Multer options we use.
  interface MulterOptions {
    storage?: any;
    limits?: {
      fileSize?: number;
      files?: number;
    };
    fileFilter?: (
      req: Request,
      file: MulterFile,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ) => void;
  }

  function diskStorage(options?: DiskStorageOptions): any;

  export { diskStorage, DiskStorageOptions, MulterOptions };
}

declare namespace Express {
  namespace Multer {
    interface File {
      /** Field name specified in the form */
      fieldname: string;
      /** Name of the file on the user's computer */
      originalname: string;
      /** Encoding type of the file */
      encoding: string;
      /** Mime type of the file */
      mimetype: string;
      /** Size of the file in bytes */
      size: number;
      /** The folder to which the file has been saved */
      destination: string;
      /** The name of the file within the destination */
      filename: string;
      /** Location of the uploaded file */
      path: string;
      /** A Buffer of the entire file (if in memory) */
      buffer: Buffer;
    }
  }
}
