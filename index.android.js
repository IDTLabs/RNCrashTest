/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React, { Component } from "react";
import { AppRegistry, StyleSheet, Text, View } from "react-native";
import { observable } from "mobx";

export default class rncrasher extends Component {
	@observable foo = [];

	constructor( props, context ) {
		super( props, context );

		let f = () => {
			let ff = [ { a: 10 }, { b: 20 }, { c: 30 } ];
			ff = ff.concat( ff );
			ff = ff.concat( ff );
			ff = ff.concat( ff );
			ff = ff.concat( ff );
			ff = ff.concat( ff );
			ff = ff.concat( ff );
			ff = ff.concat( ff );
			ff = ff.concat( ff );
			ff = ff.concat( ff );
			ff = ff.concat( ff );
			ff = ff.concat( ff );
			ff = ff.concat( ff );
			// ff = ff.concat( ff );
			this.foo = ff;

			console.log( 'APEEK1', this.foo[ 10 ], ff[ 10 ], this.foo.peek()[ 10 ] );
			console.log( 'APEEK2', this.foo[ 1000 ], ff[ 1000 ], this.foo.peek()[ 1000 ] );
		};

		setInterval( f, 2000 );

	}

	render() {
		return (
			<View style={styles.container}>
				<Text style={styles.welcome}>
					Welcome to React Native!
				</Text>
				<Text style={styles.instructions}>
					To get started, edit index.android.js
				</Text>
				<Text style={styles.instructions}>
					Double tap R on your keyboard to reload,{'\n'}
					Shake or press menu button for dev menu
				</Text>
			</View>
		);
	}
}

const styles = StyleSheet.create( {
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#F5FCFF',
	},
	welcome: {
		fontSize: 20,
		textAlign: 'center',
		margin: 10,
	},
	instructions: {
		textAlign: 'center',
		color: '#333333',
		marginBottom: 5,
	},
} );

AppRegistry.registerComponent( 'rncrasher', () => rncrasher );
