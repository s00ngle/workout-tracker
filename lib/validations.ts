export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return '비밀번호는 최소 8자 이상이어야 합니다';
  }
  if (!/[A-Z]/.test(password)) {
    return '비밀번호에 대문자가 포함되어야 합니다';
  }
  if (!/[0-9]/.test(password)) {
    return '비밀번호에 숫자가 포함되어야 합니다';
  }
  return null;
};

export const validateNickname = (nickname: string): string | null => {
  if (nickname.length < 2) {
    return '닉네임은 최소 2자 이상이어야 합니다';
  }
  if (nickname.length > 20) {
    return '닉네임은 최대 20자 이하여야 합니다';
  }
  if (!/^[a-zA-Z0-9_한-힣]+$/.test(nickname)) {
    return '닉네임은 영문, 숫자, _, 한글만 포함 가능합니다';
  }
  return null;
};
