import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { postConfigUpdateToAPI } from '../utils/config-constants';
import BrandingConfig from '../components/admin/config/general/BrandingConfig';
import { ServerStatusContext } from '../utils/server-status-context';

jest.mock('../utils/config-constants', () => ({
  postConfigUpdateToAPI: jest.fn(),
  RESET_TIMEOUT: 3000,
}));

jest.mock('next-export-i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockedPost = postConfigUpdateToAPI as jest.Mock;

const renderBranding = () => {
  const setFieldInConfigState = jest.fn();
  render(
    <ServerStatusContext.Provider
      value={
        {
          serverConfig: {
            instanceDetails: {
              name: '旧品牌',
              logo: '/logo',
              summary: '旧简介',
              extraPageContent: '旧正文',
              appearanceVariables: {},
            },
          },
          setFieldInConfigState,
        } as never
      }
    >
      <BrandingConfig />
    </ServerStatusContext.Provider>,
  );
  return { setFieldInConfigState };
};

describe('BrandingConfig', () => {
  beforeEach(() => {
    mockedPost.mockReset();
    mockedPost.mockImplementation(({ onSuccess }) => onSuccess && onSuccess('changed'));
  });

  test('shows an update button and reports success after the brand is saved', async () => {
    renderBranding();

    expect(screen.getByRole('button', { name: '更新品牌' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '更新品牌' }));

    await waitFor(() => {
      expect(screen.getByText('品牌已更新')).toBeInTheDocument();
    });

    const paths = mockedPost.mock.calls.map(call => call[0].apiPath);
    expect(paths).toEqual(['/name', '/serversummary', '/pagecontent', '/appearance']);
    expect(mockedPost.mock.calls[0][0].data.value).toBe('旧品牌');
    expect(mockedPost.mock.calls[1][0].data.value).toBe('旧简介');
    expect(mockedPost.mock.calls[2][0].data.value).toBe('旧正文');
    expect(mockedPost.mock.calls[3][0].data.value['brand-primary']).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(mockedPost.mock.calls[3][0].data.value['brand-accent']).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  test('shows a failure message when saving the brand name fails', async () => {
    mockedPost.mockImplementation(({ onError }) => onError && onError('rejected'));
    renderBranding();

    fireEvent.click(screen.getByRole('button', { name: '更新品牌' }));

    await waitFor(() => {
      expect(screen.getByText('更新品牌失败：rejected')).toBeInTheDocument();
    });
  });

  test('saves the summary and extra page content entered in the form', async () => {
    renderBranding();

    fireEvent.change(screen.getByPlaceholderText('用一两句话介绍直播间'), {
      target: { value: '新简介' },
    });
    fireEvent.change(screen.getByPlaceholderText('用 Markdown 写给观众看的介绍正文'), {
      target: { value: '新正文' },
    });
    fireEvent.click(screen.getByRole('button', { name: '更新品牌' }));

    await waitFor(() => {
      expect(screen.getByText('品牌已更新')).toBeInTheDocument();
    });

    expect(mockedPost.mock.calls[1][0].data.value).toBe('新简介');
    expect(mockedPost.mock.calls[2][0].data.value).toBe('新正文');
  });

  test('does not call the API when the brand name is empty', async () => {
    renderBranding();
    fireEvent.change(screen.getByPlaceholderText('你的品牌名称'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: '更新品牌' }));

    await waitFor(() => {
      expect(screen.getByText('更新品牌失败：请填写品牌名称。')).toBeInTheDocument();
    });
    expect(mockedPost).not.toHaveBeenCalled();
  });
});
