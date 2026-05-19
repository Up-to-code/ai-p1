import { useRouter } from "expo-router";

import { ErrorStateScreen } from "@/shell/components/ErrorStateScreen";
import { getErrorState } from "@/shell/errorStates";

export default function NotFoundScreen() {
  const router = useRouter();
  const state = getErrorState("not-found");

  return (
    <ErrorStateScreen
      eyebrow={state.eyebrow}
      code={state.code}
      title={state.title}
      body={state.body}
      signal={state.signal}
      technicalNote={state.technicalNote}
      Icon={state.Icon}
      actions={[
        {
          label: "Go home",
          onPress: () => router.replace("/(app)"),
        },
        {
          label: "Back",
          kind: "secondary",
          onPress: () => router.back(),
        },
      ]}
    />
  );
}
