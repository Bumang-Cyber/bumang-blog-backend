import { RolesEnum } from 'src/users/const/roles.const';

export function canCreateOrUpdatePost(
  postReadPermission: RolesEnum,
  userRole?: RolesEnum,
): boolean {
  // 로그인 안 했다면 생성이나 수정 불가.
  if (!userRole) {
    return false;
  }

  // 전체공개글이면
  if (postReadPermission === null) {
    return true;
  }

  const roleHierarchy = {
    [RolesEnum.ADMIN]: 2,
    [RolesEnum.USER]: 1,
  };

  // 유저 롤이 포스트의 권한보다 같거나 높아야한다.
  return roleHierarchy[userRole] >= roleHierarchy[postReadPermission];
}
