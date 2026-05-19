import { useLocalSearchParams, useRouter } from "expo-router";

import { ErrorStateScreen } from "@/shell/components/ErrorStateScreen";
import { getErrorState } from "@/shell/errorStates";

export default function ErrorStatePreviewScreen() {
  const router = useRouter();
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const state = getErrorState(kind);

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
          label: "Try again",
          onPress: () => router.replace("/(app)"),
        },
        {
          label: "View all states",
          kind: "secondary",
          onPress: () => router.replace("/(app)/errors"),
        },
      ]}
    />
  );
}
