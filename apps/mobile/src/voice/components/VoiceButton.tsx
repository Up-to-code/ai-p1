import { Mic, MicOff } from "lucide-react-native";
import { StyleSheet } from "react-native";

import { IconButton } from "@/foundation/primitives/IconButton";
import { theme } from "@/foundation/theme/tokens";
import { useTheme } from "@/foundation/theme/ThemeProvider";
import { isExpoGo } from "@/runtime/expoRuntime";
import { useVoiceComposer } from "@/voice/hooks/useVoiceComposer";

type VoiceButtonProps = {
  inverted?: boolean;
};

export function VoiceButton({ inverted }: VoiceButtonProps) {
  const { colors } = useTheme();
  const { voiceState, start, stop } = useVoiceComposer();
  const active = voiceState === "listening" || voiceState === "transcribing";
  const disabled = isExpoGo;

  const defaultColor = inverted ? colors.background : colors.textPrimary;
  const mutedColor = inverted ? colors.textSecondary : colors.textMuted;
  const activeColor = colors.background;

  return (
    <IconButton active={active} disabled={disabled} onPress={active ? stop : start} style={disabled ? styles.disabled : undefined}>
      {active ? (
        <MicOff size={18} color={activeColor} />
      ) : (
        <Mic size={18} color={disabled ? mutedColor : defaultColor} />
      )}
    </IconButton>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.45,
  },
});

