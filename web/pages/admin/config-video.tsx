import { Col, Collapse, Row, Typography } from 'antd';
import { ReactElement } from 'react';
import { useAdminText } from '../../utils/adminText';
import { CodecSelector as VideoCodecSelector } from '../../components/admin/CodecSelector';
import { VideoLatency } from '../../components/admin/VideoLatency';
import { CurrentVariantsTable } from '../../components/admin/CurrentVariantsTable';
import { AutoplaySelector } from '../../components/admin/AutoplaySelector';

import { AdminLayout } from '../../components/layouts/AdminLayout';

const { Panel } = Collapse;
const { Title } = Typography;

export default function ConfigVideoSettings() {
  const tx = useAdminText();
  return (
    <div className="config-video-variants">
      <Title>{tx('Video configuration')}</Title>
      <p className="description">
        {tx(
          'Before changing your video configuration visit the video documentation to learn how it impacts your stream performance. The general rule is to start conservatively by having one middle quality stream output variant and experiment with adding more of varied qualities.',
        )}{' '}
        <a
          href="https://owncast.online/docs/video?source=admin"
          target="_blank"
          rel="noopener noreferrer"
        >
          {tx('visit the video documentation')}
        </a>
      </p>

      <Row gutter={[45, 16]}>
        <Col md={24} lg={12}>
          <div className="form-module variants-table-module">
            <CurrentVariantsTable />
          </div>
        </Col>
        <Col md={24} lg={12}>
          <div className="form-module latency-module">
            <VideoLatency />
          </div>

          <div className="form-module autoplay-module">
            <AutoplaySelector />
          </div>

          <Collapse className="advanced-settings codec-module">
            <Panel header={tx('Advanced Settings')} key="1">
              <div className="form-module variants-table-module">
                <VideoCodecSelector />
              </div>
            </Panel>
          </Collapse>
        </Col>
      </Row>
    </div>
  );
}

ConfigVideoSettings.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout page={page} />;
};
