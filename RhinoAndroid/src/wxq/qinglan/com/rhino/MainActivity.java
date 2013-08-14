package wxq.qinglan.com.rhino;

import org.mozilla.javascript.Scriptable;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

public class MainActivity extends Activity {

	private String LOGCAT_TAG = "rhino";

	private LinearLayout mainView;
	private ViewGroup contentView;
	private Evaluator evaluator;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		// setContentView(R.layout.activity_main);

		mainView = new LinearLayout(this);
		mainView.setOrientation(LinearLayout.VERTICAL);
		final EditText navigatorView = new EditText(this);
		navigatorView.setTextSize(20);
		navigatorView.append("Hello Rhino JavaScript!");
		contentView = new FrameLayout(this);
		mainView.addView(navigatorView);
		mainView.addView(contentView);
		setContentView(mainView);

		evaluator = new Evaluator();

		evaluator.setTheActivity(this);

		evaluator.setContentView(contentView);
		
		evaluator.init();
		this.run();
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.activity_main, menu);
		return true;
	}

	private void run() {
		 String source = "var f = 'fuck';var TextView = Packages.android.widget.TextView;var Color = Packages.android.graphics.Color;var view = new TextView(TheActivity);view.setText(f);view.setBackgroundColor(Color.rgb(255, 255, 0));TheContentView.removeAllViews();TheContentView.addView(view);";
		this.evaluator.eval(source);

		Scriptable scope = this.evaluator.getScope();


		Object activity = scope.get("TheActivity", scope);
		
		if (activity == Scriptable.NOT_FOUND) {
			Log.i(LOGCAT_TAG, "activity is null");
		} else {
			Log.i(LOGCAT_TAG, "activity is not null");
		}
	}
}
