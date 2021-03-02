import { Shoot } from '../types'

export const shoot: Shoot = {
  id: '9HFxlk9v-1-Jb1J-hinh_chi_tiet-0',
  paths: {
    final: 'customers/J7dJ/9HFxlk9v/final/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0',
    original: 'orders/9HFxlk9v/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/original',
    post_script: 'scripts/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/post.jsx',
    pre_action: 'orders/9HFxlk9v/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/pre',
    pre_script: 'scripts/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/pre.jsx',
    preview: 'public/9HFxlk9v/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0',
    retouched: 'orders/9HFxlk9v/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0/retouched',
    wm: 'customers/J7dJ/9HFxlk9v/wm/9HFxlk9v-1-Jb1J-hinh_chi_tiet-0',
  },
  pre_script_content: 'var xxx // pre script',
  post_script_content: 'var xxx // post script',
}

export function createShoot(id: string) {
  return {
    id,
    paths: {
      final: `customers/J7dJ/9HFxlk9v/final/${id}`,
      original: `orders/9HFxlk9v/${id}/original`,
      post_script: `scripts/${id}/post.jsx`,
      pre_action: `orders/9HFxlk9v/${id}/pre`,
      pre_script: `scripts/${id}/pre.jsx`,
      preview: `public/9HFxlk9v/${id}`,
      retouched: `orders/9HFxlk9v/${id}/retouched`,
      wm: `customers/J7dJ/9HFxlk9v/wm/${id}`,
    },
    pre_script_content: 'var xxx // pre script',
    post_script_content: 'var xxx // post script',
  }
}
