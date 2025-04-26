import { RolesEnum } from 'src/users/const/roles.const';

export function canReadPost(
  postReadPermission: RolesEnum,
  userRole?: RolesEnum,
): boolean {
  if (!postReadPermission) {
    // 읽기 권한이 null이면 모두 접근 가능
    return true;
  }

  if (!userRole) {
    // 로그인 안 했는데 읽기 권한이 필요한 경우
    return false;
  }

  const roleHierarchy = {
    [RolesEnum.ADMIN]: 2,
    [RolesEnum.USER]: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[postReadPermission];
}
