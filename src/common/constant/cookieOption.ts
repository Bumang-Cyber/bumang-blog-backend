// 공통 쿠키 옵션을 상수로 정의
// 쿠키 옵션 헬퍼 메서드
function getCookieOptions(isProduction: boolean = false) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    path: '/',
  };
}

const ACCESS_TOKEN_MAX_AGE = 1000 * 60 * 15; // 15분
const REFRESH_TOKEN_MAX_AGE = 1000 * 60 * 60 * 24 * 30; // 7일

export { getCookieOptions, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE };
