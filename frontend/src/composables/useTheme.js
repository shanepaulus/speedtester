import { ref, watch } from 'vue';

const STORAGE_KEY = 'theme';
const dark = ref(localStorage.getItem(STORAGE_KEY) === 'dark');

function apply(isDark) {
  document.documentElement.classList.toggle('dark', isDark);
}

apply(dark.value);

watch(dark, (val) => {
  apply(val);
  localStorage.setItem(STORAGE_KEY, val ? 'dark' : 'light');
});

export function useTheme() {
  return {
    dark,
    toggle: () => { dark.value = !dark.value; },
  };
}
