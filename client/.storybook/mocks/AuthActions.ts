/**
 * Mock AuthActions for Storybook
 * Simulates authentication without real API calls
 * Updates both MockStateStore AND MobX stores for proper component updates
 */

import AuthStore from '@client/stores/AuthStore';

import mockStateStore from './MockStateStore';

const AuthActions = {
  authenticate: ({username, _password}: {username: string; _password: string}) => {
    console.log('[MockAuthActions] Authenticating user:', username);

    // Update current user in state
    const state = mockStateStore.getState();
    const user = state.users.find((u: {username: string; level: number}) => u.username === username) || state.users[0];

    const response = {
      success: true,
      username: user.username,
      level: user.level,
    };

    if (user) {
      mockStateStore.setState({currentUser: user});
      // Update MobX store with the exact response shape
      AuthStore.handleLoginSuccess(response);
    }

    return Promise.resolve(response);
  },

  createUser: ({username, _password}: {username: string; _password: string}) => {
    console.log('[MockAuthActions] Creating user:', username);

    // Add user to state
    const state = mockStateStore.getState();
    const newUser = {username, level: 5}; // Default level
    const users = [...state.users, newUser];
    mockStateStore.setState({users});

    // Update MobX store
    AuthStore.handleCreateUserSuccess({
      username,
      level: newUser.level,
    });

    return Promise.resolve({
      success: true,
      username,
    });
  },

  updateUser: (username: string, {_password, _currentPassword}: {_password?: string; _currentPassword?: string}) => {
    console.log('[MockAuthActions] Updating user:', username);
    // In mock, just resolve - password changes don't affect anything
    return Promise.resolve();
  },

  deleteUser: (username: string) => {
    console.log('[MockAuthActions] Deleting user:', username);

    // Remove user from state
    const state = mockStateStore.getState();
    const users = state.users.filter((u: {username: string; level: number}) => u.username !== username);
    mockStateStore.setState({users});

    // Update AuthStore with new user list
    // Note: AuthStore expects full user objects with client info, but we only store minimal info
    // This is fine for Storybook mocking purposes

    return Promise.resolve();
  },

  logout: () => {
    console.log('[MockAuthActions] Logging out');

    // Clear current user
    mockStateStore.setState({currentUser: {username: '', level: 0}});

    // AuthStore will handle logout internally when auth fails

    return Promise.resolve();
  },

  fetchUsers: () => {
    console.log('[MockAuthActions] Fetching users');
    const state = mockStateStore.getState();

    // Update MobX store
    // Note: AuthStore expects full user objects with client info, but we only store minimal info
    // This is fine for Storybook mocking purposes

    return Promise.resolve(state.users);
  },

  verify: () => {
    console.log('[MockAuthActions] Verifying authentication');
    const state = mockStateStore.getState();

    // Update MobX store
    AuthStore.handleAuthVerificationSuccess({
      initialUser: false,
      username: state.currentUser.username,
      level: state.currentUser.level,
      configs: {
        authMethod: 'default',
        pollInterval: 5000,
      },
    });

    return Promise.resolve({
      initialUser: false,
      username: state.currentUser.username,
      level: state.currentUser.level,
      configs: {
        authMethod: 'default',
        pollInterval: 5000,
      },
    });
  },

  register: ({username, _password}: {username: string; _password: string}) => {
    console.log('[MockAuthActions] Registering initial user:', username);

    // Create the first user
    const newUser = {username, level: 10}; // Admin level for first user
    mockStateStore.setState({
      users: [newUser],
      currentUser: newUser,
    });

    // Update MobX store
    AuthStore.handleRegisterSuccess({
      username: newUser.username,
      level: newUser.level,
    });

    return Promise.resolve({
      success: true,
      username: newUser.username,
    });
  },
};

export default AuthActions;
