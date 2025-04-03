class UserState {
  private static instance: UserState;
  private user: { _id: string; role: string; fullName?: string; avatar?: string } | null;

  private constructor() {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('role');
    const userFullName = localStorage.getItem('fullName');
    const userAvatar = localStorage.getItem('avatar');

    if (userId && userRole) {
      this.user = { 
        _id: userId, 
        role: userRole,
        fullName: userFullName || undefined,
        avatar: userAvatar || undefined
      };
    } else {
      this.user = null;
    }
  }

  static getInstance(): UserState {
    if (!UserState.instance) {
      UserState.instance = new UserState();
    }
    return UserState.instance;
  }

  setUser(user: { _id: string; role: string; fullName?: string; avatar?: string } | null): void {
    this.user = user;
    if (user) {
      localStorage.setItem('userId', user._id);
      localStorage.setItem('role', user.role);
      if (user.fullName) localStorage.setItem('fullName', user.fullName);
      if (user.avatar) localStorage.setItem('avatar', user.avatar);
    } else {
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
      localStorage.removeItem('fullName');
      localStorage.removeItem('avatar');
    }
  }

  getUser(): { _id: string; role: string; fullName?: string; avatar?: string } | null {
    return this.user;
  }

  removeUser(): void {
    this.setUser(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('fullName');
    localStorage.removeItem('avatar');
  }
}

const userState = UserState.getInstance();
export default userState;
