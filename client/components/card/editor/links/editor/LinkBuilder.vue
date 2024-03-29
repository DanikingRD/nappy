<template>
  <v-form ref="form" @submit.prevent="trySave">
    <v-divider thickness="4" color="black"></v-divider>
    <LinkItem :link="linkPreview" color="black" :use-native-icons="true" />

    <v-divider thickness="4" color="black"></v-divider>
    <template v-if="isPhone">
      <v-switch
        class="ml-3"
        label="Use international phone number"
        v-model="interPhoneNumber"
        color="black"
        hide-details
      ></v-switch>
    </template>
    <TextField
      v-else
      @input="(e) => updateTitle(e.target.value)"
      v-model="title"
      variant="underlined"
      :label="httpLinks[link.type].label"
      type="not-empty"
    >
      <template #details>
        <Icon name="ph:link-simple-bold" size="15" class="mr-2" />
        <nuxt-link
          :to="httpLinks[link.type].url + title"
          target="_blank"
          class="font-italic text-grey-darken-3"
        >
          {{ httpLinks[link.type].url + title }}
        </nuxt-link>
      </template>
    </TextField>

    <TextField
      @input="(e) => updateLabel(e.target.value)"
      v-model="label"
      variant="underlined"
      label="Label (optional)"
      hint="This is optional, but it helps you remember what this link is for."
    />
    <p class="font-italic mt-4">Here are some suggestions for your label:</p>
    <div style="max-width: 400px">
      <v-row class="mt-1">
        <v-col v-for="suggestion in suggestionsMap[link.type]" cols="4">
          <v-btn
            max-width="130"
            min-width="100"
            class="elevation-0 text-capitalize"
            variant="outlined"
            rounded
            @click="updateLabel(capitalizeSuggestion(suggestion))"
          >
            <p>{{ suggestion }}</p>
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <v-divider thickness="3" class="mt-4"></v-divider>
    <v-row class="mt-3 mb-3">
      <v-col cols="6">
        <v-btn
          @click="onCancel"
          class="elevation-0 mr-3 text-capitalize"
          variant="outlined"
          >Cancel</v-btn
        >
        <v-btn class="bg-black elevation-0 text-capitalize" type="submit"
          >Save</v-btn
        >
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup lang="ts">
import { LinkDTO } from "~~/api/dtos/card.dto";

const emit = defineEmits(["save", "cancel"]);
const props = defineProps({
  link: {
    type: Object as PropType<LinkDTO>,
    required: true,
  },
  mode: {
    type: String as PropType<"edit" | "create">,
    required: true,
  },
});
const editor = useCardEditorStore();
const form = ref<HTMLFormElement | null>(null);
const label = ref("");
const links = reactive(editor.card.links);
const title = ref("");
const linkPreview = reactive({
  title: props.link.title,
  subtitle: props.link.subtitle,
  type: props.link.type,
});
const interPhoneNumber = ref(true);
const dialCode = ref("");

const isPhone = computed(() => {
  return props.link.type === "phone" || props.link.type === "whatsapp";
});

const phoneNumberText = computed(() => {
  return "+" + dialCode.value + title.value;
});

const countrySelected = (val: any) => {
  dialCode.value = val.dialCode;
  linkPreview.title = phoneNumberText.value;
};
const phoneOpts = {
  validCharactersOnly: true,
  autoFormat: false,
  showDialCode: true,
  autocomplete: "off",
  mode: interPhoneNumber.value ? "international" : "national",
  dropdownOptions: {
    showDialCodeInSelection: true,
    showFlags: true,
    showDialCodeInList: true,
  },
};
const updateTitle = (newVal: string) => {
  title.value = newVal;
  if (props.link.title === "phone") {
    linkPreview.title = phoneNumberText.value;
  } else {
    linkPreview.title = title.value;
  }
  editor.card.links[links.length - 1].title = linkPreview.title;
};
onMounted(() => {
  if (props.mode === "create") {
    // Prevent creating a link if the previous one is empty
    // In development mode, hot reload will cause this to be called multiple times
    if (links.length > 0) {
      // If the last link is empty, don't create a new one
      if (links[links.length - 1].title === "") {
        return;
      }
    }
    // Create a new link if the previous one is not empty or there are not links
    editor.card.links.push({
      type: props.link.type,
      title: "",
      subtitle: "",
      id: "",
    });
  }

  if (props.mode === "edit") {
    label.value = props.link.subtitle;
    title.value = props.link.title;
  }
});

const updateLabel = (update: string) => {
  label.value = update;
  linkPreview.subtitle = label.value;
  if (props.mode === "create") {
    editor.card.links[editor.card.links.length - 1].subtitle = label.value;
  } else {
    editor.card.links.find((entry) => entry.id === props.link.id)!.subtitle =
      label.value;
  }
};

const onCancel = () => {
  if (props.mode === "create") {
    editor.card.links.pop();
  }
  emit("cancel");
};

const onSave = () => {
  if (props.mode === "create") {
    // Add some sort of id here to make it easier to edit
    editor.card.links[editor.card.links.length - 1].id = generateId();
  }
  if (props.link.type === "phone") {
    if (!title.value) return;
  }
  emit("save");
};
// Generate a unique id for the link
// This id is only valid for the current session that hans't been saved
// Most of the times this will not be needed, as the id is generated by the backend
const generateId = () => {
  return (
    props.link.type +
    ":" +
    Math.random().toString(36) +
    ":" +
    label.value +
    ":" +
    props.link.title
  );
};
const trySave = async () => {
  if (!form.value) {
    return;
  }
  const { valid } = await form.value.validate();
  // Return if this is not a valid form
  if (!valid) {
    return;
  }
  onSave();
};

// Suggestions for the optional label
const suggestionsMap: { [key: string]: string[] } = {
  instagram: ["personal", "business", "entertainment", "news"],
  twitter: ["politics", "sports", "business", "personal"],
  tiktok: ["dance", "comedy", "education", "entertainment"],
  linkedin: ["professional", "networking", "recruiter"],
  facebook: ["personal", "family", "friends", "business"],
  email: ["personal", "work", "business", "newsletter"],
  phone: ["personal", "work", "business", "Emergency"],
  whatsapp: ["personal", "work", "group chat", "urgent"],
  discord: ["community", "gaming", "study group", "friends"],
  telegram: ["personal", "work", "group chat", "business"],
};

const capitalizeSuggestion = (suggestion: string) => {
  return suggestion.charAt(0).toUpperCase() + suggestion.slice(1);
};
</script>
