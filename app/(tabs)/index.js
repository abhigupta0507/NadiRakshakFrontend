import { Text, View } from "react-native";
import "../../global.css";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link href={"../screens/login"}>
        <Text className="text-primary">
          Edit app/index.tsx to edit this screen.
        </Text>
      </Link>
    </View>
  );
}
