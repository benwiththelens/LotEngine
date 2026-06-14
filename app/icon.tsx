import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* The White L (offset left) */}
        <div style={{
          position: 'absolute',
          left: '10%',
          bottom: '15%',
          fontSize: 32,
          color: 'black',
          fontWeight: 900,
          fontStyle: 'italic',
          fontFamily: 'JetBrains Mono',
        }}>
          L
        </div>
        
        {/* The Blue Bar (offset right) */}
        <div style={{
          position: 'absolute',
          right: '25%',
          top: '25%',
          width: '20%',
          height: '50%',
          background: '#0055FF',
        }} />
      </div>
    ),
    {
      ...size,
    }
  );
}
