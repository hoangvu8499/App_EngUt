@AGENTS.md

# EngUt

English-learning app (Expo/React Native). Helps users memorize vocabulary fast by topic, practice writing sentences, and follow a graded learning path with tests. Tagline: "EngUt | Learn Good — Cook after learn good".

**Core architectural constraint: fully offline-first.** All vocabulary, sentences, phonetics, accounts, and progress are stored on-device. There is no backend and no network calls at runtime — do not design a feature around a content API or remote auth.

## Tech stack

- Expo SDK 57, React Native 0.86, React 19, TypeScript (strict).
- `@react-native-async-storage/async-storage` — all local persistence (accounts, word groups).
- `@expo/vector-icons` (Ionicons) — UI icons (buttons, form fields, nav).
- Cute per-topic/menu illustrations are PNGs downloaded from Google's **Noto Emoji** repo (Apache 2.0, no attribution required) into `assets/topics/` and `assets/menu/` — see "Sourcing images" below.
- `expo-speech` — on-device text-to-speech for the flash card word-pronunciation button (`Speech.speak(word, { language: 'en-US' })`); no network call, so it doesn't break offline-first.
- Web support (`react-dom`, `react-native-web`, `@expo/metro-runtime`) is installed so the app can also run via `npx expo start --web`, useful for fast iteration/testing without a device.

## Screen flow (state machine in `App.tsx`)

`App.tsx` holds a single `screen` string in `useState` and renders one screen at a time — there is no navigation library (kept intentionally simple; revisit if the flow grows much deeper).

```
Login ──(register link)──> Register ──(success, auto-login)──┐
  │(login success)                                            │
  └───────────────────────────────────────────────────────────┴──> Home
                                                                       │ tap a topic card
                                                                       ▼
                                                              TopicDetailScreen (4 menu items)
                                                                       │ tap "Flash Card"
                                                                       ▼
                                                                 FlashCardScreen
                                                          (tap "Nhóm từ" → CreateGroupModal popup)
                                                                       │ tap an existing group card
                                                                       ▼
                                                              FlashCardStudyScreen
```

- Login and Register both land on **Home** directly on success (register auto-logs-in; it no longer bounces back to Login).
- Any not-yet-built destination (Ngữ Pháp / Luyện Tập / Kiểm tra menu items, "Dò bài ngẫu nhiên") routes to the generic `SuccessScreen` placeholder (shows "SUCCESS" + subtitle + a labeled back button). This is the standing pattern for stubbing out future features — always give tap feedback and a way back, never a dead click.
- Home and TopicDetail (and FlashCard, and FlashCardStudy) share the exact same header via `src/components/AppHeaderCard.tsx` (logo + greeting + progress bar + logout button). When a design says "keep the header as-is", it means reuse this component unchanged rather than re-implementing it.
- `src/screens/FlashCardStudyScreen.tsx` is the actual flip-card study view for one word group (opened by tapping a group card in `FlashCardScreen`): a two-sided card (front = word/phonetic/example in the active direction, back = the translation, flipped via `Animated` rotateY), a single `PanResponder` handling both tap-to-flip and horizontal swipe-to-navigate (swipe right = next word, swipe left = previous — matches the user's stated direction, not the more common inverse), an EN-VN/VN-EN direction toggle, a position counter, and a shuffle toggle that reshuffles `order` (an index array separate from the group's stored `wordIndices`, so shuffling never mutates storage). Word audio uses `expo-speech`'s `Speech.speak(text, { language: 'en-US' })` — the only "audio" dependency in the app, still fully on-device (TTS, no network/API call).

## Data

- `data/Topic_vocabulary.json` — the single source of truth for all 25 topics and vocab. Shape: `[{ topic: string, vocabularies: [{ vocabulary, transcription, meaning, sentenceEng, sentenceMeaning }] }]`. Loaded via `src/data/topics.ts` (`import rawTopics from '../../data/Topic_vocabulary.json'` — TS `resolveJsonModule` is on via Expo's base tsconfig).
- `src/data/topicVisuals.ts` — maps each topic name to its icon (PNG) + an accent color from a small palette. Falls back to a default icon if a topic name isn't found (defensive, since the JSON is an external content file that could change).
- `src/data/wordGroups.ts` — types + constants for Flash Card word grouping: `MIN_GROUP_SIZE=5`, `MAX_GROUP_SIZE=10`, `FINAL_GROUP_THRESHOLD=10`, `FINAL_GROUP_NAME='Nhóm cuối'`, plus the pure `validateNewGroup()` validator (name required + unique, size 5–10).
- `src/storage/wordGroupStorage.ts` — AsyncStorage-backed CRUD for a topic's word groups, keyed `engut_word_groups_{topicName}`. `addWordGroup()` also auto-creates a `"Nhóm cuối"` group with whatever remains if the leftover ungrouped count drops below `FINAL_GROUP_THRESHOLD` after the new group is saved.
- `src/storage/userStorage.ts` — AsyncStorage-backed accounts, keyed `engut_users`. Login/register compare against this list directly — **no API of any kind for auth**, per explicit product requirement. `seedDefaultUser()` (called once on app mount) ensures a default test account exists: `vutth` / `123456789`.

## Design assets → screens

`design/*.jpg` are phone-frame mockups exported from the design tool; treat them as the visual spec when building the matching screen, but written chat instructions override the mockup where they conflict (has happened: register-screen field set, "Luyện Tập" subtitle wording, ungrouped-word row format).

| File | Screen |
|---|---|
| `login.jpg` | `LoginScreen` |
| `register.jpg` | `RegisterScreen` |
| `home.jpg` | `HomeScreen` |
| `Detail_topic.jpg` | `TopicDetailScreen` |
| `Flash_card.jpg` | `FlashCardScreen` |
| `logo-tron.jpg` / `Logo-dai.jpg` | app logo, used directly via `require()` (not copied into `assets/`) |

## Sourcing images ("cute" icons)

When a screen needs illustrative icons and Ionicons' monochrome vector icons aren't cute/colorful enough (explicit user preference), download real images rather than hand-rolling SVGs — but pick a source with a clear, permissive license and no network dependency at runtime:

1. Prefer **Noto Emoji** (`https://raw.githubusercontent.com/googlefonts/noto-emoji/main/png/128/emoji_u{codepoint}.png`, Apache 2.0). Verify the URL exists (`curl -sI`) before wiring it into code — not every emoji/codepoint combination exists in that path.
2. Download into `assets/<feature>/<name>.png` and `require()` locally — never hotlink a remote URI, that would break the app's offline-first requirement.
3. Avoid Flaticon/Freepik-style "free with attribution" sets unless the user asks for that specific look; Noto's Apache-2.0 license carries no such obligation.

## Known UI gotchas already fixed once — don't reintroduce

- `KeyboardAvoidingView`'s `behavior` prop must be set for Android too (`'height'`), not just iOS (`'padding'`) — leaving it `undefined` on Android means the keyboard silently covers focused inputs. Login/Register screens wrap their form in a `ScrollView` for the same reason.
- `Alert.alert` is a **no-op on web** (`react-native-web` stubs it out entirely) — never gate real logic (like a navigation transition) on an `Alert` button's `onPress`; use inline error/success UI state instead, which also works better for validation UX in general.
- The logo JPGs (`logo-tron.jpg` etc.) have a baked-in light-gray backdrop (`colors.logoBackground`, `#F0EFEC`, sampled from the actual file). Give the `Image`'s container that same background color wherever the logo is shown, or `resizeMode="contain"` letterboxing shows a mismatched color band.

## Testing

- Type-check after every change: `npx tsc --noEmit`.
- The user tests on their own physical Android device (Samsung Galaxy A53, connected via `adb`/USB, Expo Go). **Don't drive the device yourself** (no adb screenshots/taps) unless explicitly asked — just report what changed and let them verify. `npx expo start --web` + Playwright is fine for a quick sanity check when no device is connected.
