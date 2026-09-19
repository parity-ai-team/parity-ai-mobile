import { StyleSheet, Text, View } from 'react-native';

// S01 시작 화면 자리. 실제 UI/UX는 feat/onboarding-screens PR에서 구현한다.
export default function StartScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PARITY AI</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
});
