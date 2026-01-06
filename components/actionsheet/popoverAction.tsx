import React from "react";
import { View } from "react-native";
import { Button, Popover } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { withUniwind } from "uniwind";
import { AppText } from "@/components/app-text";

const StyledIonicons = withUniwind(Ionicons);

export default function PopoverExample() {
  return (
    <View className="flex-1 items-center justify-center">
      <Popover>
        <Popover.Trigger asChild>
          <Button variant="secondary">More Options</Button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Overlay className="bg-black/15" />

          <Popover.Content presentation="bottom-sheet">
            <View className="gap-4">
              <View className="mb-2">
                <Popover.Title className="text-center text-foreground">
                  Share Options
                </Popover.Title>
                <Popover.Description className="text-center text-muted">
                  Choose how you'd like to share this content
                </Popover.Description>
              </View>

              <View className="gap-2">
                {/* Share */}
                <View className="flex-row items-center gap-3 p-3 rounded-lg">
                  <View className="size-10 items-center justify-center rounded-full bg-accent/10">
                    <StyledIonicons
                      name="share-social"
                      size={20}
                      className="text-accent"
                    />
                  </View>
                  <View className="flex-1">
                    <AppText className="text-base font-medium text-foreground">
                      Share Link
                    </AppText>
                    <AppText className="text-xs text-muted">
                      Send via messaging app
                    </AppText>
                  </View>
                </View>

                {/* Copy */}
                <View className="flex-row items-center gap-3 p-3 rounded-lg">
                  <View className="size-10 items-center justify-center rounded-full bg-warning/10">
                    <StyledIonicons
                      name="copy-outline"
                      size={20}
                      className="text-warning"
                    />
                  </View>
                  <View className="flex-1">
                    <AppText className="text-base font-medium text-foreground">
                      Copy Link
                    </AppText>
                    <AppText className="text-xs text-muted">
                      Copy to clipboard
                    </AppText>
                  </View>
                </View>

                {/* Download */}
                <View className="flex-row items-center gap-3 p-3 rounded-lg">
                  <View className="size-10 items-center justify-center rounded-full bg-success/10">
                    <StyledIonicons
                      name="download-outline"
                      size={20}
                      className="text-success"
                    />
                  </View>
                  <View className="flex-1">
                    <AppText className="text-base font-medium text-foreground">
                      Save Offline
                    </AppText>
                    <AppText className="text-xs text-muted">
                      Download for later
                    </AppText>
                  </View>
                </View>
              </View>

              <Popover.Close asChild>
                <Button
                  variant="secondary"
                  size="lg"
                  className="self-stretch mt-2"
                >
                  Cancel
                </Button>
              </Popover.Close>
            </View>
          </Popover.Content>
        </Popover.Portal>
      </Popover>
    </View>
  );
}
