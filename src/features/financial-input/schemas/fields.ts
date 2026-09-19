import { z } from 'zod';

// 재사용 가능한 zod 필드 빌더. 전부 "문자열 입력값을 검증"만 하고 숫자로
// 바꾸지 않는다 — 실제 타입 변환은 각 화면의 to*Input() 변환 함수가 맡고,
// 그 함수의 반환 타입 주석(HouseholdInput 등)이 컴파일 타임에 생성 타입과
// 어긋나지 않는지 확인해 준다. 여기서는 형식(정수·범위·YYYY-MM)만 맞춘다.

const NON_NEGATIVE_INT_PATTERN = /^\d+$/;
const POSITIVE_INT_PATTERN = /^[1-9]\d*$/;
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const AMOUNT_FORMAT_MESSAGE = '0 이상의 정수만 입력할 수 있어요 (음수·소수 불가).';
const MONTH_FORMAT_MESSAGE = 'YYYY-MM 형식으로 입력해 주세요 (예: 2027-03).';

// 필수 금액(KRW). 음수·소수·빈 값을 거부한다.
export function requiredKrwString(requiredMessage: string) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .regex(NON_NEGATIVE_INT_PATTERN, AMOUNT_FORMAT_MESSAGE);
}

// 선택 금액(KRW). 비우면 서버 기본값(null 또는 0)으로 취급한다 — 변환은
// to*Input()에서 한다.
export function optionalKrwString() {
  return z
    .string()
    .trim()
    .refine((value) => value === '' || NON_NEGATIVE_INT_PATTERN.test(value), {
      message: AMOUNT_FORMAT_MESSAGE,
    });
}

// 필수 YYYY-MM.
export function requiredMonthString(requiredMessage: string) {
  return z.string().trim().min(1, requiredMessage).regex(MONTH_PATTERN, MONTH_FORMAT_MESSAGE);
}

// 선택 YYYY-MM. 비우면 null로 취급한다.
export function optionalMonthString() {
  return z
    .string()
    .trim()
    .refine((value) => value === '' || MONTH_PATTERN.test(value), {
      message: MONTH_FORMAT_MESSAGE,
    });
}

// 1 이상 정수(예: 출산 순서).
export function requiredPositiveIntString(requiredMessage: string) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .regex(POSITIVE_INT_PATTERN, '1 이상의 정수만 입력할 수 있어요.');
}

// 0 이상 정수(예: 부양가족 수).
export function requiredNonNegativeIntString(requiredMessage: string) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .regex(NON_NEGATIVE_INT_PATTERN, '0 이상의 정수만 입력할 수 있어요.');
}

// 범위가 있는 선택 정수(예: 휴직 개월 수, 소득 지연 주 수). 비우면
// to*Input()에서 defaultValue로 취급한다.
export function optionalIntRangeString(range: { min: number; max: number }) {
  return z
    .string()
    .trim()
    .refine(
      (value) => {
        if (value === '') return true;
        if (!NON_NEGATIVE_INT_PATTERN.test(value)) return false;
        const parsed = Number(value);
        return parsed >= range.min && parsed <= range.max;
      },
      { message: `${range.min}~${range.max} 사이의 정수만 입력할 수 있어요.` },
    );
}
