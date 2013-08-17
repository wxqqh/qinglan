var f = 'fuck';
var TextView = Packages.android.widget.TextView;
var Color = Packages.android.graphics.Color;
var view = new TextView(TheActivity);
view.setText(f);
view.setBackgroundColor(Color.rgb(255, 255, 0));
TheContentView.removeAllViews();
TheContentView.addView(view);