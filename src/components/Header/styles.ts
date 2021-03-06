import styled from 'styled-components/native';

import colors from 'styles/colors';

export const HeaderTitleContainer = styled.Text.attrs({
  numberOfLines: 1,
})`
  font-size: 20px;
  font-weight: bold;
  color: ${colors.n100};
`;
