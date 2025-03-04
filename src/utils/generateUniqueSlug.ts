import crypto from 'crypto';
import slugify from 'slugify';

const generateUniqueSlug = (title: string): string => {
  // 한글 제목을 위한 처리
  let slug = slugify(title, {
    lower: true, // 소문자로 변환
    strict: true, // 특수문자 제거
    trim: true, // 앞뒤 공백 제거
  });

  // slugify가 한글을 제대로 처리하지 못한 경우
  if (!slug || slug.length === 0) {
    // 한글 제목을 base64로 인코딩
    slug = Buffer.from(title)
      .toString('base64')
      .replace(/[+/=]/g, '') // URL에 안전하지 않은 문자 제거
      .toLowerCase()
      .slice(0, 30); // 적절한 길이로 자르기
  }

  const shortId = crypto.randomBytes(3).toString('hex');
  return `${slug}-${shortId}`;
};

export default generateUniqueSlug;
