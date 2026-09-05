import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'engut_users';

export type StoredUser = {
  fullName: string;
  username: string;
  email: string;
  password: string;
};

async function getUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as StoredUser[]) : [];
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export async function findUserByLogin(login: string): Promise<StoredUser | undefined> {
  const users = await getUsers();
  const normalizedLogin = normalize(login);
  return users.find(
    (user) => normalize(user.username) === normalizedLogin || normalize(user.email) === normalizedLogin
  );
}

export async function isUsernameOrEmailTaken(username: string, email: string): Promise<boolean> {
  const users = await getUsers();
  const normalizedUsername = normalize(username);
  const normalizedEmail = normalize(email);
  return users.some(
    (user) => normalize(user.username) === normalizedUsername || normalize(user.email) === normalizedEmail
  );
}

export async function registerUser(user: StoredUser): Promise<void> {
  const users = await getUsers();
  users.push(user);
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}
