import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    type PressableProps,
    type PressableStateCallbackType,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

type PrimaryButtonProps = PressableProps & {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);
};

export function PrimaryButton({
  title,
  loading = false,
  disabled,
  variant = 'primary',
  style,
  ...props
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={(state) => [
        styles.button,
        variant === 'secondary' ? styles.secondary : styles.primary,
        state.pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#155E63' : '#FFFFFF'} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'secondary' ? styles.secondaryText : styles.primaryText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#155E63',
  },
  secondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6E0DC',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#155E63',
  },
});