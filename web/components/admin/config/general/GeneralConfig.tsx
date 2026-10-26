import { useTranslation } from 'next-export-i18n';
import EditInstanceDetails from './EditInstanceDetails';
import EditInstanceTags from './EditInstanceTags';
import EditSocialLinks from './EditSocialLinks';
import EditPageContent from './EditPageContent';
import { Localization } from '../../../../types/localization';
import { translated } from '../../../../utils/playerLanguage';

// eslint-disable-next-line react/function-component-definition
export default function PublicFacingDetails() {
  const { t } = useTranslation();
  return (
    <div className="config-public-details-page">
      <p className="description">
        {translated(
          t,
          Localization.Admin.General.publicDetails,
          '以下内容会显示在你的网站上，用来介绍直播和它的内容。',
        )}{' '}
        <a
          href="https://owncast.online/docs/website/?source=admin"
          target="_blank"
          rel="noopener noreferrer"
        >
          {translated(t, Localization.Admin.General.learnMore, '了解更多。')}
        </a>
      </p>

      <div className="top-container">
        <div className="form-module instance-details-container">
          <EditInstanceDetails />
        </div>

        <div className="form-module social-items-container ">
          <div className="form-module tags-module">
            <EditInstanceTags />
          </div>

          <div className="form-module social-handles-container">
            <EditSocialLinks />
          </div>
        </div>
      </div>
      <div className="form-module page-content-module">
        <EditPageContent />
      </div>
    </div>
  );
}
