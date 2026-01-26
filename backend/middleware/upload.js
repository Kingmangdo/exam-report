import multer from 'multer';

// 메모리 스토리지 사용 (파일을 메모리에 저장)
const storage = multer.memoryStorage();

// 파일 필터 (Excel 파일만 허용)
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'application/octet-stream' // 일부 브라우저에서 xlsx를 이렇게 보냄
  ];

  if (allowedMimes.includes(file.mimetype) || 
      file.originalname.endsWith('.xlsx') || 
      file.originalname.endsWith('.xls')) {
    cb(null, true);
  } else {
    cb(new Error('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 제한
  }
});
