#import <GoogleCast/GoogleCast.h>
#import "RNGoogleCastButton.h"

@implementation RNGoogleCastButton
{
  GCKUICastButton *_castButton;
  UIColor *_tintColor;
}

-(void)layoutSubviews {
  [super layoutSubviews];
  if (!_castButton) {
    _castButton = [[GCKUICastButton alloc] initWithFrame:self.bounds];
    _castButton.tintColor = _tintColor;
    [self addSubview:_castButton];
  } else {
    _castButton.frame = self.bounds;
  }
}

-(void)setTintColor:(UIColor *)color {
  _tintColor = color;
  if (_castButton) {
    _castButton.tintColor = color;
  }
  super.tintColor = color;
  [self setNeedsDisplay];
}

@end
