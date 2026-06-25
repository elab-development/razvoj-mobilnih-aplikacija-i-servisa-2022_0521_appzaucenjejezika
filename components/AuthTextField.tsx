import {
    StyleSheet,
    Text,
    TextInput,
    type TextInputProps,
    View,
} from 'react-native';

type AuthTextFieldProps = TextInputProps & {
  label: string;
};

export function AuthTextField({ label, style, ...props }: AuthTextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#8A9994"
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2F413D',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#13221F',
  },
});