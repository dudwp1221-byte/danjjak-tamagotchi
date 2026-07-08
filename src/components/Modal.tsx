import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './modal.css'

interface ModalProps {
  title: string
  /** 제목 앞에 붙는 아이콘 (UIIcon 등). 주면 title 문자열의 선행 이모지 대신 이걸 표시 */
  titleIcon?: ReactNode
  onClose: () => void
  children: ReactNode
  /** 헤더 우측에 표시할 추가 정보 (예: 코인 잔액) */
  headerExtra?: ReactNode
  /**
   * 'modal'(기본): 화면 중앙 팝업 + 배경.
   * 'inline': 배경/닫기/Esc 없이 컨테이너를 꽉 채우는 패널 —
   *  하단 탭 가로 페이저의 각 페이지로 임베드할 때 사용.
   */
  variant?: 'modal' | 'inline'
}

/** 화면 중앙에 뜨는 재사용 모달. 배경 클릭/Esc로 닫힌다. */
export default function Modal({ title, titleIcon, onClose, children, headerExtra, variant = 'modal' }: ModalProps) {
  // 아이콘을 주면 title에서 선행 이모지를 떼고 텍스트만 (aria-label은 원본 title 유지)
  const titleNode = titleIcon ? (
    <><span className="modal-title-icon">{titleIcon}</span> {title.replace(/^[^\p{L}\p{N}]+/u, '')}</>
  ) : (
    title
  )
  useEffect(() => {
    if (variant === 'inline') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // 패닉(Esc)과 충돌 방지: 모달이 열려 있으면 모달만 닫는다
        e.stopPropagation()
        onClose()
      }
    }
    // 캡처 단계에서 먼저 처리해 패닉 토글보다 우선
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose, variant])

  // 인라인(페이저 페이지) — 배경·닫기 버튼 없이 내용만
  if (variant === 'inline') {
    return (
      <section className="modal modal--inline" aria-label={title}>
        <header className="modal-header">
          <h3>{titleNode}</h3>
          {headerExtra && <div className="modal-header-right">{headerExtra}</div>}
        </header>
        <div className="modal-body">{children}</div>
      </section>
    )
  }

  // 페이저 트랙(transform) 안에서 열려도 화면 중앙에 오도록 body로 포탈
  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h3>{titleNode}</h3>
          <div className="modal-header-right">
            {headerExtra}
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
