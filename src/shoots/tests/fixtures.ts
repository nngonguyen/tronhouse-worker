import { Shoot } from '../types'

export const shoot: Shoot = {
  id: '9HFxlk9v-1-Jb1J-hinh_chi_tiet-0',
  package_item_id: '',
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
}

export function createShoot(id: string): Shoot {
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
    package_item_id: '',
  }
}
