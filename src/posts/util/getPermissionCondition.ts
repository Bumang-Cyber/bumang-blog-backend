import { CurrentUserDto } from 'src/common/dto/current-user.dto';
import { RolesEnum } from 'src/users/const/roles.const';
import { IsNull } from 'typeorm';

// 권한 조건 설정
export const getPermissionCondition = (currentUser: CurrentUserDto | null) => {
  if (!currentUser) {
    // 비로그인: 공개 포스트만
    return { readPermission: IsNull() };
  } else if (currentUser.role === 'user') {
    // USER: 공개 + USER 권한 포스트
    return [{ readPermission: IsNull() }, { readPermission: currentUser.role }];
  } else {
    // ADMIN: 공개 + USER + ADMIN 권한 포스트 (모든 권한)
    return [
      { readPermission: IsNull() },
      { readPermission: RolesEnum.USER },
      { readPermission: currentUser.role },
    ];
  }
};
