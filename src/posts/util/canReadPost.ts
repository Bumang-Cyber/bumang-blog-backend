import { RolesEnum } from 'src/users/const/roles.const';

export function canReadPost(
  postReadPermission: RolesEnum | null,
  userRole?: RolesEnum | null,
): boolean {
  console.log(userRole, postReadPermission, 'userRole,  postReadPermission');

  console.log('👩‍🍳1');
  if (!postReadPermission) {
    console.log('👩‍🍳2');
    // 읽기 권한이 null이면 모두 접근 가능
    return true;
  }

  console.log('👩‍🍳3');
  if (!userRole && !!postReadPermission) {
    // 로그인 안 했는데 읽기 권한이 필요한 경우
    console.log('👩‍🍳4');
    return false;
  }

  console.log('👩‍🍳5');
  const roleHierarchy = {
    [RolesEnum.ADMIN]: 2,
    [RolesEnum.USER]: 1,
  };

  console.log('👩‍🍳7');
  return roleHierarchy[userRole] >= roleHierarchy[postReadPermission];
}
