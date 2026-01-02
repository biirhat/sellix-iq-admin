import Feather from '@expo/vector-icons/Feather';
import Octicons from '@expo/vector-icons/Octicons';
import {
    Button,
    useToast
} from 'heroui-native';
import { Platform, View } from 'react-native';
import { withUniwind } from 'uniwind';
import { UsageVariant } from './component-presentation/types';
import { UsageVariantFlatList } from './component-presentation/usage-variant-flatlist';

const StyledFeather = withUniwind(Feather);
const StyledOcticons = withUniwind(Octicons);

// ------------------------------------------------------------------------------

const DefaultVariantsContent = () => {
  const { toast } = useToast();

  return (
    <View className="flex-1 items-center justify-center px-5 gap-5">
      <Button
        variant="secondary"
        onPress={() =>
          toast.show({
            variant: 'success',
            label: 'You have upgraded your plan',
            description: 'You can continue using HeroUI Chat',
            icon: (
              <StyledOcticons
                name="shield-check"
                size={16}
                className="text-success mt-[3px]"
              />
            ),
            actionLabel: 'Close',
            onActionPress: ({ hide }) => hide(),
          })
        }
      >
        Success toast
      </Button>
      <Button
        variant="secondary"
        onPress={() =>
          toast.show({
            variant: 'danger',
            label: 'Storage is full',
            description:
              "Remove files to release space.",
            icon: (
              <StyledFeather
                name="hard-drive"
                size={16}
                className="text-danger mt-[3px]"
              />
            ),
            actionLabel: 'Close',
            onActionPress: ({ hide }) => hide(),
          })
        }
      >
        Danger toast
      </Button>
      <Button onPress={() => toast.hide('all')} variant="danger-soft">
        Hide all toasts
      </Button>
    </View>
  );
};

// ------------------------------------------------------------------------------

const PlacementVariantsContent = () => {
  const { toast } = useToast();

  const showBottomToast = () =>
    toast.show({
      variant: 'warning',
      placement: 'bottom',
      label: 'You have no credits left',
      description: 'Upgrade to a paid plan to continue',
      icon: (
        <StyledOcticons
          name="shield"
          size={16}
          className="text-warning mt-[3px]"
        />
      ),
      actionLabel: 'Close',
      onActionPress: ({ hide }) => hide(),
    });

  return (
    <View className="flex-1 items-center justify-center px-5 gap-5">
      <Button
        variant="secondary"
        onPress={showBottomToast}
      >
        Bottom toast
      </Button>
      <Button onPress={() => toast.hide('all')} variant="danger-soft">
        Hide all toasts
      </Button>
    </View>
  );
};

// ------------------------------------------------------------------------------

const DifferentContentSizesContent = () => {
  const { toast } = useToast();

  return (
    <View className="flex-1 items-center justify-center px-5 gap-5">
      <Button
        variant="secondary"
        onPress={() =>
          toast.show({
            variant: 'success',
            label: 'Payment successful',
            description:
              'Your subscription has been renewed. You will be charged $9.99/month.',
            actionLabel: 'Close',
            onActionPress: ({ hide }) => hide(),
          })
        }
      >
        Medium toast
      </Button>
      <Button
        variant="secondary"
        onPress={() =>
          toast.show({
            variant: 'success',
            label: 'Backup completed successfully',
            description:
              'All your files have been backed up to the cloud. You can now access them from any device.',
            actionLabel: 'Close',
            onActionPress: ({ hide }) => hide(),
          })
        }
      >
        Large toast
      </Button>
      <Button onPress={() => toast.hide('all')} variant="danger-soft">
        Hide all toasts
      </Button>
    </View>
  );
};

// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------

const TOAST_VARIANTS_IOS: UsageVariant[] = [
  {
    value: 'default-variants',
    label: 'Default variants',
    content: <DefaultVariantsContent />,
  },
  {
    value: 'placement-variants',
    label: 'Placement variants',
    content: <PlacementVariantsContent />,
  },
  {
    value: 'different-content-sizes',
    label: 'Different content sizes',
    content: <DifferentContentSizesContent />,
  },

];

const TOAST_VARIANTS_ANDROID: UsageVariant[] = [
  {
    value: 'default-variants',
    label: 'Default variants',
    content: <DefaultVariantsContent />,
  },
  {
    value: 'placement-variants',
    label: 'Placement variants',
    content: <PlacementVariantsContent />,
  },
  {
    value: 'different-content-sizes',
    label: 'Different content sizes',
    content: <DifferentContentSizesContent />,
  },

];

export default function ToastScreen() {
  return (
    <UsageVariantFlatList
      data={Platform.OS === 'ios' ? TOAST_VARIANTS_IOS : TOAST_VARIANTS_ANDROID}
    />
  );
}