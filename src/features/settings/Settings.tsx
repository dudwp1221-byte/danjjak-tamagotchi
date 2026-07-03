import { useState } from 'react'
import { requestNotificationPermission } from '../../hooks/useCareNotifications'
import { getApiKey, setApiKey } from '../../utils/chat'
import Modal from '../../components/Modal'
import './settings.css'

import type { Theme } from '../../utils/storage'

interface SettingsProps {
  notifications: boolean
  onToggleNotifications: (value: boolean) => void
  theme: Theme
  onToggleTheme: (value: Theme) => void
  /** (Electron) 항상 위 토글 — 없으면 데스크톱 아님 */
  onAlwaysOnTop?: () => void
  /** (Electron) 클릭 통과 토글 */
  onClickThrough?: () => void
  /** 로그인된 아이디 (게스트면 null) */
  loggedInId?: string | null
  /** 로그아웃 → 로비로 */
  onLogout?: () => void
  /** 로비(로그인 화면)로 이동 */
  onGoLobby?: () => void
  /** 튜토리얼 다시 보기 */
  onReplayTutorial: () => void
  onClose: () => void
}

export default function Settings({
  notifications,
  onToggleNotifications,
  theme,
  onToggleTheme,
  onAlwaysOnTop,
  onClickThrough,
  loggedInId = null,
  onLogout,
  onGoLobby,
  onReplayTutorial,
  onClose,
}: SettingsProps) {
  const [msg, setMsg] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    const k = getApiKey()
    return k ? `${k.slice(0, 8)}${'·'.repeat(12)}` : ''
  })
  const [apiKeyEditing, setApiKeyEditing] = useState(false)

  const handleToggleNotif = async () => {
    if (!notifications) {
      const ok = await requestNotificationPermission()
      if (!ok) {
        setMsg('브라우저에서 알림 권한이 거부되어 켤 수 없어요.')
        return
      }
      onToggleNotifications(true)
      setMsg('알림을 켰어요. 탭을 벗어나 있을 때 알려드릴게요!')
    } else {
      onToggleNotifications(false)
      setMsg('알림을 껐어요.')
    }
  }

  return (
    <Modal title="⚙️ 설정" onClose={onClose}>
      <div className="set-section">
        <div className="set-row">
          <div className="set-text">
            <span className="set-name">케어 알림</span>
            <span className="set-desc">
              자리를 비운 사이 펫이 케어가 필요하면 알림을 보내요.
            </span>
          </div>
          <button
            type="button"
            className={'set-toggle' + (notifications ? ' on' : '')}
            onClick={handleToggleNotif}
            role="switch"
            aria-checked={notifications}
          >
            <span className="set-knob" />
          </button>
        </div>
        <div className="set-row" style={{ marginTop: '0.75rem' }}>
          <div className="set-text">
            <span className="set-name">화면 테마</span>
            <span className="set-desc">밝은/어두운 화면을 선택해요.</span>
          </div>
          <button
            type="button"
            className="set-theme"
            onClick={() => onToggleTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '🌙 다크' : '☀️ 라이트'}
          </button>
        </div>
        {(onAlwaysOnTop || onClickThrough) && (
          <>
            {onAlwaysOnTop && (
              <div className="set-row" style={{ marginTop: '0.75rem' }}>
                <div className="set-text">
                  <span className="set-name">📌 항상 위</span>
                  <span className="set-desc">창을 다른 창보다 항상 앞에 띄워요.</span>
                </div>
                <button type="button" className="set-theme" onClick={onAlwaysOnTop}>
                  전환
                </button>
              </div>
            )}
            {onClickThrough && (
              <div className="set-row" style={{ marginTop: '0.75rem' }}>
                <div className="set-text">
                  <span className="set-name">👻 클릭 통과</span>
                  <span className="set-desc">창을 클릭이 통과하도록 해요 (바탕화면 조작용).</span>
                </div>
                <button type="button" className="set-theme" onClick={onClickThrough}>
                  전환
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="set-section">
        <p className="set-label">☁️ 계정</p>
        {loggedInId ? (
          <div className="set-row">
            <div className="set-text">
              <span className="set-name">{loggedInId} 님</span>
              <span className="set-desc">진행 상황이 클라우드에 자동 저장돼요.</span>
            </div>
            <button type="button" className="set-btn" onClick={() => onLogout?.()}>
              로그아웃
            </button>
          </div>
        ) : (
          <div className="set-row">
            <div className="set-text">
              <span className="set-name">게스트 모드</span>
              <span className="set-desc">로그인하면 다른 기기에서도 이어 키울 수 있어요.</span>
            </div>
            <button type="button" className="set-btn" onClick={() => onGoLobby?.()}>
              로그인
            </button>
          </div>
        )}
      </div>

      <div className="set-section">
        <p className="set-label">AI 대화 키</p>
        <div className="set-rename">
          <input
            className="set-name-input"
            type={apiKeyEditing ? 'text' : 'password'}
            value={apiKeyEditing ? apiKeyInput : (getApiKey() ? '••••••••••••••••••••' : '')}
            placeholder="sk-ant-..."
            maxLength={200}
            onFocus={() => { setApiKeyEditing(true); setApiKeyInput('') }}
            onChange={(e) => setApiKeyInput(e.target.value)}
            aria-label="Anthropic API 키"
          />
          <button
            type="button"
            className="set-btn"
            onClick={() => {
              setApiKey(apiKeyInput)
              setApiKeyEditing(false)
              setMsg(apiKeyInput.trim() ? 'API 키를 저장했어요.' : 'API 키를 삭제했어요.')
            }}
          >
            저장
          </button>
        </div>
        <p className="set-desc">
          펫과 AI 채팅을 하려면 Anthropic API 키가 필요해요. 기기에만 저장되며 외부로 전송되지 않아요.
        </p>
      </div>

      <div className="set-section">
        <p className="set-label">도움말</p>
        <button
          type="button"
          className="set-btn set-wide"
          onClick={onReplayTutorial}
        >
          📘 튜토리얼 다시 보기
        </button>
      </div>

      {msg && <p className="set-msg">{msg}</p>}
    </Modal>
  )
}
