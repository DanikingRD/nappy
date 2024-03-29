<template>
  <v-list-item :key="link.title">
    <template #title>
      <v-list-item-title style="font-size: 14px" v-text="link.title" />
    </template>
    <template #subtitle>
      <p style="font-size: 13px">{{ subtitleDisplay }}</p>
    </template>
    <template #prepend>
      <v-avatar :color="useNativeIcons ? undefined : color">
        <Icon
          :class="additionalMargin"
          :size="iconSize.toString()"
          :color="iconColor"
          :name="
            useNativeIcons
              ? httpLinks[link.type].nativeIcon
              : httpLinks[link.type].customIcon
          "
        />
      </v-avatar>
    </template>
    <template #append>
      <slot name="append"></slot>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
const props = defineProps<{
  link: {
    title: string;
    subtitle?: string;
    type: string;
  };
  color: string;
  useNativeIcons: boolean;
}>();

const subtitleDisplay = computed(() => {
  if (!props.link.subtitle) return "";
  return (
    props.link.subtitle.charAt(0).toUpperCase() +
    props.link.subtitle.slice(1).toLowerCase()
  );
});

const iconSize = computed(() => {
  return props.useNativeIcons ? 30 : 24;
});
const additionalMargin = computed(() => {
  return {};
});
const iconColor = computed(() => {
  // We need to check if the card color is darker or lighter than a certain
  // threshold, and then return a black or white to make a contrast with the
  // background color.

  // parse RGB from HEX
  const rgb = parseInt(props.color.replace("#", ""), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  // calculate luminance srgb
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma > 128 ? "black" : "white";
});
</script>
