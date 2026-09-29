import { ReactElement } from 'react';
import { Tabs } from 'antd';
import { useTranslation } from 'next-export-i18n';

import GeneralConfig from '../../../../components/admin/config/general/GeneralConfig';
import AppearanceConfig from '../../../../components/admin/config/general/AppearanceConfig';
import BrandingConfig from '../../../../components/admin/config/general/BrandingConfig';

import { AdminLayout } from '../../../../components/layouts/AdminLayout';
import { EditCustomJavascript } from '../../../../components/admin/EditCustomJavascript';
import { Localization } from '../../../../types/localization';
import { translated } from '../../../../utils/playerLanguage';

export default function PublicFacingDetails() {
  const { t } = useTranslation();
  const label = (key: string, fallback: string) => translated(t, key, fallback);

  return (
    <div className="config-public-details-page">
      <Tabs
        defaultActiveKey="brand"
        centered
        items={[
          {
            label: label(Localization.Admin.General.brandingTab, '品牌'),
            key: 'brand',
            children: <BrandingConfig />,
          },
          {
            label: label(Localization.Admin.General.generalTab, '常规'),
            key: 'general',
            children: <GeneralConfig />,
          },
          {
            label: label(Localization.Admin.General.appearanceTab, '外观'),
            key: 'appearance',
            children: <AppearanceConfig />,
          },
          {
            label: label(Localization.Admin.General.customScriptingTab, '自定义脚本'),
            key: 'scripting',
            children: <EditCustomJavascript />,
          },
        ]}
      />
    </div>
  );
}

PublicFacingDetails.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout page={page} />;
};
