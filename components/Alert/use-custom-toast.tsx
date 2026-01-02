import Feather from '@expo/vector-icons/Feather';
import Octicons from '@expo/vector-icons/Octicons';
import { useToast } from 'heroui-native';
import { View as ReactNativeView } from 'react-native';
import { withUniwind } from 'uniwind';

// Wrap components with uniwind to enable className prop
const StyledOcticons = withUniwind(Octicons);
const StyledFeather = withUniwind(Feather);
const View = withUniwind(ReactNativeView);

export const useCustomToast = () => {
  const { toast } = useToast();

  // --- Variant-based toasts (default to bottom placement) ---

  const showSuccess = (label: string, description?: string) => {
    toast.show({
      variant: 'success',
      label,
      description,
      icon: (
        <View className="mt-0.5">
          <StyledOcticons
            name="shield-check"
            size={16}
            className="text-success mt-[3px]"
          />
        </View>
      ),
      placement: 'bottom',
      actionLabel: 'Close',
      onActionPress: ({ hide }) => hide(),
    });
  };

  const showError = (label: string, description?: string) => {
    toast.show({
      variant: 'danger',
      label,
      description,
      icon: (
        <View className="mt-0.5">
          <StyledFeather
            name="hard-drive"
            size={16}
            className="text-danger mt-[3px]"
          />
        </View>
      ),
      placement: 'top',
      actionLabel: 'Close',
      onActionPress: ({ hide }) => hide(),
    });
  };

  const showWarning = (label: string, description?: string) => {
    toast.show({
      variant: 'warning',
      placement: 'top',
      label,
      description,
      icon: (
        <View className="mt-0.5">
          <StyledOcticons
            name="shield"
            size={16}
            className="text-warning mt-[3px]"
          />
        </View>
      ),
      actionLabel: 'Close',
      onActionPress: ({ hide }) => hide(),
    });
  };

  // --- Placement-based toasts ---

  const showTopToast = (label: string, description?: string) => {
    toast.show({
      variant: 'success', // Defaulting to success for this example
      placement: 'top',
      label,
      description,
      icon: (
        <View className="mt-0.5">
          <StyledOcticons
            name="shield-check"
            size={16}
            className="text-success mt-[3px]"
          />
        </View>
      ),
      actionLabel: 'Close',
      onActionPress: ({ hide }) => hide(),
    });
  };

  // --- Size-based toasts (demonstration) ---

  const showMediumToast = () => {
    toast.show({
      variant: 'success',
      label: 'Payment successful',
      description:
        'Your subscription has been renewed. You will be charged $9.99/month.',
      placement: 'top',
      actionLabel: 'Close',
      onActionPress: ({ hide }) => hide(),
    });
  };

  const showLargeToast = () => {
    toast.show({
      variant: 'success',
      label: 'Backup completed successfully',
      description:
        'All your files have been backed up to the cloud. You can now access them from any device.',
      placement: 'top',
      actionLabel: 'Close',
      onActionPress: ({ hide }) => hide(),
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showTopToast,
    showMediumToast,
    showLargeToast,
  };
};
