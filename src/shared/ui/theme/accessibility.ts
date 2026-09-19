// docs/frontend.md 접근성 완료 조건: "터치 영역 최소 44×44pt".
export const accessibility = {
  minTouchTarget: 44,
} as const;

// 시각적으로 minTouchTarget보다 작게 그려야 하는 요소(아이콘 버튼 등)에서
// 실제 터치 영역만 44×44pt로 확보하고 싶을 때 쓰는 hitSlop 계산기.
// 컴포넌트 크기 자체를 minTouchTarget 이상으로 키울 수 있다면 이 함수 대신
// style.minHeight/minWidth에 accessibility.minTouchTarget을 바로 준다.
export function getMinTouchHitSlop(visualSize: number) {
  const inset = Math.max(0, Math.ceil((accessibility.minTouchTarget - visualSize) / 2));
  return { top: inset, bottom: inset, left: inset, right: inset };
}
