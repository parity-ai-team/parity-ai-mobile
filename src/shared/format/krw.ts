// docs/frontend.md "경계 원칙": 화면은 금액을 재계산하지 않고 표시만 한다.
// 이 함수는 정수 KRW 값을 천 단위 구분 문자열로 바꿀 뿐, 값 자체를 만들거나
// 고치지 않는다.
const KRW_NUMBER_FORMAT = new Intl.NumberFormat('ko-KR');

export function formatKrw(amountKrw: number): string {
  return `${KRW_NUMBER_FORMAT.format(amountKrw)}원`;
}
