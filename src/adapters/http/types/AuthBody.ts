export interface AuthBody {
  email: string;
  password: string;
}

export interface RegisterBody extends AuthBody {
  name: string;
}
