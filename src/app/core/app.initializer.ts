import { AuthService } from './auth.service';

export function appInitializer(AuthService: AuthService) {
  return () =>
    new Promise((resolve) => {
      AuthService.refreshToken().subscribe().add(resolve);
    });
}
