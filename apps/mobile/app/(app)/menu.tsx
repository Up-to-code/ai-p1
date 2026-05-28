import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Screen } from "@/foundation/primitives/Screen";
import { ChatDrawerContent } from "@/shell/components/ChatDrawer";

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Screen safe={false}>
      <ChatDrawerContent
        onClose={() => router.dismissAll()}
        onNavigateProfile={() => router.navigate("/(app)/profile")}
        onOpenFullHistory={() => router.navigate("/(app)/threads" as never)}
        topInset={insets.top}
        bottomInset={insets.bottom}
        showClose
      />
    </Screen>
  );
}
