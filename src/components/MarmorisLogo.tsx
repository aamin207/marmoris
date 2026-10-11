/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React from 'react';
import Image from 'next/image';

interface MarmorisLogoProps {
  className?: string;
  width?: number;
  height?: number;
  light?: boolean;
  priority?: boolean;
}

export default function MarmorisLogo({
  className = '',
  width = 160,
  height = 50,
  light = false,
  priority = true
}: MarmorisLogoProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <Image
        src="/logo.png"
        alt="لوگوی گالری مرموریس Marmoris"
        width={width}
        height={height}
        priority={priority}
        referrerPolicy="no-referrer"
        className={`object-contain w-auto h-auto max-h-full max-w-full transition-all duration-200 ${
          light ? 'brightness-0 invert' : ''
        }`}
      />
    </div>
  );
}

