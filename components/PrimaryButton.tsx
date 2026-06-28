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

import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();

  return (
    <Pressable
      style={(state) => [
        styles.button,
         variant === 'secondary'
          ? {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: 1,
            }
          : { backgroundColor: theme.colors.accent },
        state.pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      disabled={isDisabled}
      {...props}
    >
      {loading ? ( 
        <ActivityIndicator
          color={variant === 'secondary' ? theme.colors.accent : theme.colors.inverseText}
        />
             ) : (
        <Text
          style={[
            styles.text,
           {
              color:
                variant === 'secondary'
                  ? theme.colors.accent
                  : theme.colors.inverseText,
            },
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
});