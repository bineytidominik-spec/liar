import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dominikbineyti.liar",
  appName: "Liar",
  webDir: "out",
  ios: {
    contentInset: "always",
    backgroundColor: "#fdf7f0",
  },
  plugins: {
    // Haptics are handled natively via @capacitor/haptics
  },
};

export default config;
