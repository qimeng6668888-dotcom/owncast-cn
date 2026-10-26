import EditStorage from './EditStorage';
import { useAdminText } from '../../../../utils/adminText';

// eslint-disable-next-line react/function-component-definition
export default function ConfigStorageInfo() {
  const tx = useAdminText();
  return (
    <>
      <p className="description">
        {tx(
          'Owncast supports optionally using external storage providers to stream your video. Learn more about this by visiting our',
        )}{' '}
        <a
          href="https://owncast.online/docs/storage/?source=admin"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tx('Storage Documentation')}
        </a>
        .
      </p>
      <p className="description">
        {tx(
          'Configuring this incorrectly will likely cause your video to be unplayable. Double check the documentation for your storage provider on how to configure the bucket you created for Owncast.',
        )}
      </p>
      <p className="description">
        {tx(
          'Keep in mind this is for live streaming, not for archival, recording or VOD purposes.',
        )}
      </p>
      <EditStorage />
    </>
  );
}
