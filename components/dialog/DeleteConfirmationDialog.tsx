import { Ionicons } from '@expo/vector-icons';
import { Button, Dialog } from 'heroui-native';
import { View } from 'react-native';
import { withUniwind } from 'uniwind';

const StyledIonicons = withUniwind(Ionicons);

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

export const DeleteConfirmationDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  isLoading = false,
}: DeleteConfirmationDialogProps) => {
  return (
    <Dialog isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/40" />
        <Dialog.Content className="max-w-sm mx-auto p-6 rounded-2xl">
          <View className="size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 mb-4 self-center">
            <StyledIonicons
              name="trash-outline"
              size={24}
              className="text-red-500"
            />
          </View>
          <View className="mb-8 gap-1">
            <Dialog.Title className="text-center">{title}</Dialog.Title>
            <Dialog.Description className="text-center">
              {description}
            </Dialog.Description>
          </View>
          <View className="gap-3">
            <Button variant="danger" onPress={onConfirm} isDisabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
            <Dialog.Close asChild>
              <Button
                variant="secondary"
                isDisabled={isLoading}
              >
                Cancel
              </Button>
            </Dialog.Close>
          </View>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
