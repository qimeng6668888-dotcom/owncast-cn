import { FC } from 'react';
import { Select } from 'antd';
import { SocialHandleDropdownItem } from '../../types/config-section';
import { OTHER_SOCIAL_HANDLE_OPTION } from '../../utils/config-constants';
import { useAdminText } from '../../utils/adminText';

export type DropdownProps = {
  iconList: SocialHandleDropdownItem[];
  selectedOption: string;
  onSelected: any;
};

export const SocialDropdown: FC<DropdownProps> = ({ iconList, selectedOption, onSelected }) => {
  const tx = useAdminText();
  const handleSelected = (value: string) => {
    if (onSelected) {
      onSelected(value);
    }
  };
  const inititalSelected = selectedOption === '' ? null : selectedOption;
  return (
    <div className="social-dropdown-container">
      <p className="description">
        {tx(
          'If you are looking for a platform name not on this list, please select Other and type in your own name. A logo will not be provided.',
        )}
      </p>

      <div className="formfield-container">
        <div className="label-side">
          <span className="formfield-label">{tx('Social Platform')}</span>
        </div>
        <div className="input-side">
          <Select
            style={{ width: 240 }}
            className="social-dropdown"
            placeholder={tx('Social platform...')}
            defaultValue={inititalSelected}
            value={inititalSelected}
            onSelect={handleSelected}
          >
            {iconList.map(item => {
              const { platform, icon, key } = item;

              return (
                <Select.Option className="social-option" key={`platform-${key}`} value={key}>
                  <span className="option-icon">
                    <img src={icon} alt="" className="option-icon" />
                  </span>
                  <span className="option-label">{platform}</span>
                </Select.Option>
              );
            })}
            <Select.Option
              className="social-option"
              key={`platform-${OTHER_SOCIAL_HANDLE_OPTION}`}
              value={OTHER_SOCIAL_HANDLE_OPTION}
            >
              {tx('Other...')}
            </Select.Option>
          </Select>
        </div>
      </div>
    </div>
  );
};
